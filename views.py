import json
import os
import re
from copy import deepcopy
from datetime import datetime
from django.contrib.auth import authenticate
from django.conf import settings
from django.utils import timezone
from django.utils.crypto import get_random_string
from django.db.models import Q
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .models import AccessRequest, Project, SystemSetting, User, UserActivity
from .serializers import AccessRequestSerializer, ProjectSerializer, UserActivitySerializer, UserSerializer


ENCODING_WINDOW_KEY = "portal_encoding_window"


def _frontend_role(role: str):
    return "employee" if role == "staff" else role


def _client_ip(request):
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR", "") or ""


def _location_hint(request):
    # This is best-effort and depends on proxy/CDN headers.
    city = request.META.get("HTTP_X_CITY") or request.META.get("HTTP_X_APPENGINE_CITY")
    region = request.META.get("HTTP_X_REGION") or request.META.get("HTTP_X_APPENGINE_REGION")
    country = request.META.get("HTTP_X_COUNTRY") or request.META.get("HTTP_X_APPENGINE_COUNTRY")
    parts = [p for p in [city, region, country] if p]
    return ", ".join(parts)


def _log_activity(request, event: str, project=None, details=None):
    user = getattr(request, "user", None)
    if not user or not user.is_authenticated:
        return
    UserActivity.objects.create(
        user=user,
        role=user.role,
        event=event,
        project=project,
        ip_address=_client_ip(request),
        location_hint=_location_hint(request),
        details=details or {},
    )


def _get_encoding_window_config():
    default = {"enabled": True, "start_at": "", "end_at": ""}
    setting = SystemSetting.objects.filter(key=ENCODING_WINDOW_KEY).first()
    if not setting or not setting.value:
        return default
    try:
        data = json.loads(setting.value)
        return {
            "enabled": bool(data.get("enabled", True)),
            "start_at": str(data.get("start_at", "") or ""),
            "end_at": str(data.get("end_at", "") or ""),
        }
    except Exception:
        return default


def _parse_iso_datetime(raw):
    if not raw:
        return None
    value = str(raw).strip()
    if value.endswith("Z"):
        value = value[:-1] + "+00:00"
    dt = datetime.fromisoformat(value)
    if timezone.is_naive(dt):
        dt = timezone.make_aware(dt, timezone.get_current_timezone())
    return dt


def _resolve_encoding_window_state():
    config = _get_encoding_window_config()
    if not config["enabled"]:
        return {
            **config,
            "is_open": False,
            "message": "Encoding is currently closed by admin.",
        }

    start_at = _parse_iso_datetime(config["start_at"]) if config["start_at"] else None
    end_at = _parse_iso_datetime(config["end_at"]) if config["end_at"] else None

    # If no range is configured, encoding remains open.
    if not start_at and not end_at:
        return {
            **config,
            "is_open": True,
            "message": "Encoding is open.",
        }

    now = timezone.now()
    is_open = True
    if start_at and now < start_at:
        is_open = False
    if end_at and now > end_at:
        is_open = False

    if is_open:
        msg = "Encoding is open."
    else:
        msg = "Encoding is outside the active admin schedule."

    return {
        **config,
        "is_open": is_open,
        "message": msg,
    }


def _strip_validator_meta(profile_data):
    if not isinstance(profile_data, dict):
        return {}
    return {
        key: value
        for key, value in profile_data.items()
        if key not in ("validator_review", "contributor_snapshot")
    }


def _diff_string(value):
    if isinstance(value, (dict, list)):
        return json.dumps(value, ensure_ascii=False, sort_keys=True)
    if value is None:
        return ""
    return str(value)


def _is_empty_equivalent(value):
    if value is None:
        return True
    if isinstance(value, str):
        stripped = value.strip()
        if stripped == "":
            return True
        if stripped in {"0", "0.0", "0.00"}:
            return True
        return False
    if isinstance(value, bool):
        return value is False
    if isinstance(value, (int, float)):
        return value == 0
    if isinstance(value, (list, tuple, set)):
        return len(value) == 0
    if isinstance(value, dict):
        return len(value) == 0
    return False


def _json_diff(before, after, path=""):
    changes = []
    if isinstance(before, dict) and isinstance(after, dict):
        keys = sorted(set(before.keys()) | set(after.keys()))
        for key in keys:
            before_has = key in before
            after_has = key in after
            if before_has and not after_has and _is_empty_equivalent(before.get(key)):
                continue
            if after_has and not before_has and _is_empty_equivalent(after.get(key)):
                continue
            next_path = f"{path}.{key}" if path else str(key)
            changes.extend(_json_diff(before.get(key), after.get(key), next_path))
        return changes

    if isinstance(before, list) and isinstance(after, list):
        max_len = max(len(before), len(after))
        for idx in range(max_len):
            before_has = idx < len(before)
            after_has = idx < len(after)
            before_value = before[idx] if before_has else None
            after_value = after[idx] if after_has else None

            if before_has and not after_has and _is_empty_equivalent(before_value):
                continue
            if after_has and not before_has and _is_empty_equivalent(after_value):
                continue

            next_path = f"{path}.{idx}" if path else str(idx)
            changes.extend(_json_diff(before_value, after_value, next_path))
        return changes

    if _is_empty_equivalent(before) and _is_empty_equivalent(after):
        return changes

    if before != after:
        changes.append(
            {
                "field": path or "(root)",
                "before": _diff_string(before),
                "after": _diff_string(after),
            }
        )
    return changes


class ProjectPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        role = getattr(request.user, "role", "")
        if role in ("admin", "validator"):
            return True
        if request.method in permissions.SAFE_METHODS:
            return obj.created_by_id == request.user.id
        return obj.created_by_id == request.user.id


class EmployeeRolePermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in ("staff", "employee")
        )


class ValidatorRolePermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and request.user.role == "validator"
        )


class AdminOnlyPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == "admin")


class BaseProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated, ProjectPermission]

    def get_queryset(self):
        user = self.request.user
        role = getattr(user, "role", "")
        if role == "admin":
            return Project.objects.all().order_by("-created_at")
        if role == "validator":
            return Project.objects.filter(Q(status="proposed") | Q(status="planning")).order_by("-created_at")
        return Project.objects.filter(created_by=user).order_by("-created_at")

    @action(detail=True, methods=["post"])
    def submit(self, request, pk=None):
        project = self.get_object()
        if project.created_by_id != request.user.id and request.user.role != "admin":
            raise PermissionDenied("Only owner or admin can submit")
        if project.status == "planning":
            project.status = "proposed"
            project.save(update_fields=["status", "updated_at"])
            _log_activity(request, "project_submit", project, {"status": project.status})
        return Response({"status": project.status})

    @action(detail=True, methods=["post"])
    def validate(self, request, pk=None):
        project = self.get_object()
        role = getattr(request.user, "role", "")
        if role not in ("validator", "admin"):
            raise PermissionDenied("Only validator/admin can validate")

        action_value = (request.data.get("action") or "").lower()
        profile_data = project.profile_data if isinstance(project.profile_data, dict) else {}
        contributor_snapshot = profile_data.get("contributor_snapshot")
        if not isinstance(contributor_snapshot, dict):
            contributor_snapshot = _strip_validator_meta(profile_data)
            profile_data["contributor_snapshot"] = deepcopy(contributor_snapshot)

        incoming_edited = request.data.get("edited_profile_data")
        if incoming_edited is None:
            existing_review = profile_data.get("validator_review")
            if isinstance(existing_review, dict) and isinstance(existing_review.get("working_copy"), dict):
                edited_profile = existing_review.get("working_copy")
            else:
                edited_profile = deepcopy(contributor_snapshot)
        else:
            if not isinstance(incoming_edited, dict):
                return Response({"detail": "edited_profile_data must be a JSON object"}, status=400)
            edited_profile = incoming_edited

        edited_fields = _json_diff(contributor_snapshot, edited_profile)
        review_notes = str(request.data.get("comment") or request.data.get("notes") or "").strip()
        reviewed_at = timezone.now().isoformat()
        update_fields = ["profile_data", "updated_at"]

        if action_value in ("save_reviewed", "reviewed", "review", "save"):
            review_state = "reviewed"
            project.validated = False
            event = "project_update"
        elif action_value in ("approve", "validate"):
            review_state = "validated"
            project.status = "completed"
            project.validated = True
            update_fields.extend(["status", "validated"])
            event = "project_approve"
        elif action_value == "reject":
            review_state = "rejected"
            project.status = "planning"
            project.validated = False
            update_fields.extend(["status", "validated"])
            event = "project_reject"
        else:
            return Response({"detail": "action must be save_reviewed/validate/reject"}, status=400)

        profile_data["validator_review"] = {
            "review_status": review_state,
            "reviewed_by_id": request.user.id,
            "reviewed_by_username": request.user.username,
            "reviewed_at": reviewed_at,
            "review_notes": review_notes,
            "edited": len(edited_fields) > 0,
            "edited_fields_count": len(edited_fields),
            "edited_fields": edited_fields[:300],
            "working_copy": edited_profile,
        }
        project.profile_data = profile_data
        project.save(update_fields=list(dict.fromkeys(update_fields)))
        _log_activity(
            request,
            event,
            project,
            {
                "status": project.status,
                "review_status": review_state,
                "edited": len(edited_fields) > 0,
                "edited_fields_count": len(edited_fields),
            },
        )
        return Response(
            {
                "status": project.status,
                "review_status": review_state,
                "edited": len(edited_fields) > 0,
                "edited_fields_count": len(edited_fields),
                "reviewed_at": reviewed_at,
            }
        )

    @action(detail=True, methods=["post"])
    def archive(self, request, pk=None):
        if getattr(request.user, "role", "") != "admin":
            raise PermissionDenied("Only admin can archive")
        project = self.get_object()
        project.archived = True
        project.is_active = False
        project.save(update_fields=["archived", "is_active", "updated_at"])
        _log_activity(request, "project_archive", project, {"archived": True})
        return Response({"status": "archived"})

    def destroy(self, request, *args, **kwargs):
        if getattr(request.user, "role", "") != "admin":
            raise PermissionDenied("Only admin can delete projects")
        return super().destroy(request, *args, **kwargs)


class ProjectViewSet(BaseProjectViewSet):
    queryset = Project.objects.all()


class EmployeeProjectViewSet(BaseProjectViewSet):
    queryset = Project.objects.all()
    permission_classes = [IsAuthenticated, EmployeeRolePermission, ProjectPermission]

    def get_queryset(self):
        return Project.objects.filter(created_by=self.request.user).order_by("-created_at")

    def _ensure_encoding_open(self):
        state = _resolve_encoding_window_state()
        if not state["is_open"]:
            raise PermissionDenied(state["message"])

    def _ensure_mutable_project(self, project):
        if project.status != "planning":
            raise PermissionDenied("Submitted/validated projects are view-only for contributors.")

    def create(self, request, *args, **kwargs):
        self._ensure_encoding_open()
        response = super().create(request, *args, **kwargs)
        if response.status_code == status.HTTP_201_CREATED:
            project_id = response.data.get("id")
            project = Project.objects.filter(id=project_id).first()
            _log_activity(request, "project_create", project, {"status": response.data.get("status")})
        return response

    def update(self, request, *args, **kwargs):
        self._ensure_encoding_open()
        self._ensure_mutable_project(self.get_object())
        response = super().update(request, *args, **kwargs)
        _log_activity(request, "project_update", self.get_object(), {"status": response.data.get("status") if hasattr(response, "data") else ""})
        return response

    def partial_update(self, request, *args, **kwargs):
        self._ensure_encoding_open()
        self._ensure_mutable_project(self.get_object())
        response = super().partial_update(request, *args, **kwargs)
        _log_activity(request, "project_update", self.get_object(), {"partial": True})
        return response

    def destroy(self, request, *args, **kwargs):
        raise PermissionDenied("Only admin can delete projects")

    @action(detail=True, methods=["post"])
    def submit(self, request, pk=None):
        self._ensure_encoding_open()
        self._ensure_mutable_project(self.get_object())
        return super().submit(request, pk=pk)


class ValidatorProjectViewSet(BaseProjectViewSet):
    queryset = Project.objects.all()
    permission_classes = [IsAuthenticated, ValidatorRolePermission, ProjectPermission]

    def get_queryset(self):
        user = self.request.user
        all_projects = Project.objects.all().order_by("-created_at")
        scope = (self.request.query_params.get("scope") or "").strip().lower()

        def reviewed_by_validator(project):
            pd = project.profile_data if isinstance(project.profile_data, dict) else {}
            vr = pd.get("validator_review")
            if not isinstance(vr, dict):
                return False
            try:
                reviewed_by_id = int(vr.get("reviewed_by_id"))
            except (TypeError, ValueError):
                return False
            review_status = str(vr.get("review_status") or "").lower()
            return reviewed_by_id == user.id and review_status in ("reviewed", "validated", "rejected")

        if self.action == "list":
            if scope == "history":
                ids = [p.id for p in all_projects if reviewed_by_validator(p)]
                return Project.objects.filter(id__in=ids).order_by("-updated_at")
            return Project.objects.filter(status="proposed").order_by("-created_at")

        allowed_ids = [p.id for p in all_projects if p.status == "proposed" or reviewed_by_validator(p)]
        return Project.objects.filter(id__in=allowed_ids).order_by("-created_at")

    def update(self, request, *args, **kwargs):
        raise PermissionDenied("Use validator review actions instead of direct project edit.")

    def partial_update(self, request, *args, **kwargs):
        raise PermissionDenied("Use validator review actions instead of direct project edit.")

    def destroy(self, request, *args, **kwargs):
        raise PermissionDenied("Only admin can delete projects")


class AdminProjectViewSet(BaseProjectViewSet):
    queryset = Project.objects.all()
    permission_classes = [IsAuthenticated, AdminOnlyPermission, ProjectPermission]

    def get_queryset(self):
        return Project.objects.all().order_by("-created_at")


class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("username")
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, AdminOnlyPermission]

    @action(detail=True, methods=["post"])
    def set_active(self, request, pk=None):
        user = self.get_object()
        active = bool(request.data.get("active", True))
        if user.id == request.user.id and not active:
            return Response({"detail": "You cannot deactivate your own account."}, status=400)
        user.is_active = active
        user.save(update_fields=["is_active"])
        return Response({"id": user.id, "is_active": user.is_active})

    @action(detail=True, methods=["post"])
    def reset_password(self, request, pk=None):
        user = self.get_object()
        new_password = request.data.get("password") or get_random_string(10)
        user.set_password(new_password)
        user.save(update_fields=["password"])
        return Response({"id": user.id, "temporary_password": new_password})


class AccessRequestViewSet(viewsets.ModelViewSet):
    queryset = AccessRequest.objects.all().order_by("-created_at")
    serializer_class = AccessRequestSerializer

    def get_permissions(self):
        if self.action == "create":
            return [AllowAny()]
        return [IsAuthenticated(), AdminOnlyPermission()]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(status="pending")
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def _build_unique_username(self, email: str, full_name: str):
        local = (email or "").split("@")[0].strip().lower()
        local = re.sub(r"[^a-z0-9._-]+", "", local)
        if not local:
            local = re.sub(r"[^a-z0-9]+", "", full_name.lower()) or "user"
        base = local[:18]
        candidate = base
        idx = 1
        while User.objects.filter(username=candidate).exists():
            idx += 1
            candidate = f"{base}{idx}"
        return candidate

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        access_request = self.get_object()
        if access_request.status != "pending":
            return Response({"detail": "Request already reviewed."}, status=400)

        username = self._build_unique_username(access_request.email, access_request.full_name)
        password = get_random_string(10)
        role = "validator" if access_request.requested_role == "validator" else "staff"

        user = User(
            username=username,
            email=access_request.email,
            role=role,
        )
        user.is_staff = role == "admin"
        user.set_password(password)
        user.save()

        access_request.status = "approved"
        access_request.reviewed_by = request.user
        access_request.reviewed_at = timezone.now()
        access_request.review_notes = request.data.get("review_notes", "")
        access_request.save(update_fields=["status", "reviewed_by", "reviewed_at", "review_notes"])

        return Response(
            {
                "status": "approved",
                "created_user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "role": "contributor" if user.role == "staff" else user.role,
                    "temporary_password": password,
                },
            }
        )

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        access_request = self.get_object()
        if access_request.status != "pending":
            return Response({"detail": "Request already reviewed."}, status=400)
        access_request.status = "rejected"
        access_request.reviewed_by = request.user
        access_request.reviewed_at = timezone.now()
        access_request.review_notes = request.data.get("review_notes", "")
        access_request.save(update_fields=["status", "reviewed_by", "reviewed_at", "review_notes"])
        return Response({"status": "rejected"})


class EncodingWindowView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        state = _resolve_encoding_window_state()
        role = getattr(request.user, "role", "")
        can_encode = state["is_open"] or role in ("admin", "validator")
        return Response(
            {
                **state,
                "can_encode": can_encode,
            }
        )

    def post(self, request):
        if getattr(request.user, "role", "") != "admin":
            raise PermissionDenied("Only admin can update encoding schedule.")

        enabled = bool(request.data.get("enabled", True))
        start_at = str(request.data.get("start_at", "") or "")
        end_at = str(request.data.get("end_at", "") or "")

        if start_at:
            _parse_iso_datetime(start_at)
        if end_at:
            _parse_iso_datetime(end_at)
        if start_at and end_at and _parse_iso_datetime(start_at) > _parse_iso_datetime(end_at):
            return Response({"detail": "start_at cannot be after end_at"}, status=400)

        payload = {"enabled": enabled, "start_at": start_at, "end_at": end_at}
        SystemSetting.objects.update_or_create(
            key=ENCODING_WINDOW_KEY,
            defaults={"value": json.dumps(payload)},
        )
        return Response(_resolve_encoding_window_state())


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        role = getattr(user, "role", "")
        if role == "admin":
            all_projects = Project.objects.all()
            reviewed_projects = 0
            validator_edited_projects = 0
            for project in all_projects:
                pd = project.profile_data if isinstance(project.profile_data, dict) else {}
                vr = pd.get("validator_review")
                if isinstance(vr, dict):
                    if str(vr.get("review_status") or "").lower() == "reviewed":
                        reviewed_projects += 1
                    if bool(vr.get("edited")):
                        validator_edited_projects += 1
            data = {
                "total_projects": all_projects.count(),
                "draft_projects": all_projects.filter(status="planning").count(),
                "pending_projects": all_projects.filter(status="proposed").count(),
                "approved_projects": all_projects.filter(status="completed").count(),
                "archived_projects": all_projects.filter(archived=True).count(),
                "reviewed_projects": reviewed_projects,
                "validator_edited_projects": validator_edited_projects,
                "users": User.objects.count(),
            }
        elif role == "validator":
            data = {
                "pending_projects": Project.objects.filter(status="proposed").count(),
                "validated_today": Project.objects.filter(validated=True).count(),
                "total_validated": Project.objects.filter(validated=True).count(),
            }
        else:
            my = Project.objects.filter(created_by=user)
            data = {
                "my_projects": my.count(),
                "draft_projects": my.filter(status="planning").count(),
                "submitted_projects": my.filter(status="proposed").count(),
                "approved_projects": my.filter(status="completed").count(),
            }
        return Response(data)


class AnalyticsView(APIView):
    permission_classes = [AllowAny]

    def _path(self):
        return os.path.join(settings.BASE_DIR, "analytics.json")

    def _load(self):
        path = self._path()
        if not os.path.exists(path):
            data = {"pageviews": 0, "avg_daily": 0, "today": 0, "total_visitors": 0}
            with open(path, "w", encoding="utf-8") as f:
                json.dump(data, f)
            return data
        with open(path, "r", encoding="utf-8") as f:
            try:
                return json.load(f)
            except Exception:
                return {"pageviews": 0, "avg_daily": 0, "today": 0, "total_visitors": 0}

    def _save(self, data):
        with open(self._path(), "w", encoding="utf-8") as f:
            json.dump(data, f)

    def get(self, request):
        return Response(self._load())

    def post(self, request):
        data = self._load()
        if (request.data or {}).get("action") != "visit":
            return Response({"error": "Unsupported action"}, status=400)
        data["pageviews"] = int(data.get("pageviews", 0)) + 1
        data["today"] = int(data.get("today", 0)) + 1
        data["total_visitors"] = int(data.get("total_visitors", 0)) + 1
        if not data.get("avg_daily"):
            data["avg_daily"] = data["pageviews"] // 30
        self._save(data)
        return Response(data)


class DevLoginView(APIView):
    permission_classes = [AllowAny]

    DEMO_USERS = {
        "admin": {"password": "password", "role": "admin", "email": "admin@rdc.gov.ph"},
        "validator": {"password": "password", "role": "validator", "email": "validator@rdc.gov.ph"},
        # Persist employee-like users as "staff" to stay aligned with current DB choices.
        "employee": {"password": "password", "role": "staff", "frontend_role": "employee", "email": "employee@rdc.gov.ph"},
    }

    def post(self, request):
        if not settings.DEBUG:
            return Response({"detail": "Not available"}, status=404)

        username = (request.data.get("username") or "").strip()
        password = request.data.get("password") or ""
        demo = self.DEMO_USERS.get(username)
        if not demo or demo["password"] != password:
            return Response({"detail": "Invalid credentials"}, status=401)

        user, created = User.objects.get_or_create(
            username=username,
            defaults={"email": demo["email"], "role": demo["role"]},
        )
        if not user.is_active:
            return Response({"detail": "Account is deactivated. Contact admin."}, status=403)
        if created or not user.check_password(password):
            user.set_password(password)
        user.role = demo["role"]
        user.email = demo["email"]
        user.save()

        refresh = RefreshToken.for_user(user)
        _log_activity(request, "login", details={"username": user.username, "mode": "dev-login"})
        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "role": demo.get("frontend_role", user.role),
                },
            }
        )


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        u = request.user
        return Response({"id": u.id, "username": u.username, "email": u.email, "role": _frontend_role(u.role)})


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = (request.data.get("username") or "").strip()
        password = request.data.get("password") or ""
        user = authenticate(request, username=username, password=password)
        if not user:
            return Response({"detail": "Invalid credentials"}, status=401)
        if not user.is_active:
            return Response({"detail": "Account is deactivated. Contact admin."}, status=403)

        refresh = RefreshToken.for_user(user)
        _log_activity(request, "login", details={"username": user.username})
        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "role": _frontend_role(user.role),
                },
            }
        )


class AdminActivityView(APIView):
    permission_classes = [IsAuthenticated, AdminOnlyPermission]

    def get(self, request):
        qs = UserActivity.objects.select_related("user", "project").all()
        role_filter = (request.query_params.get("role") or "").strip()
        event_filter = (request.query_params.get("event") or "").strip()
        user_filter = (request.query_params.get("user") or "").strip()
        limit_raw = request.query_params.get("limit")

        if role_filter:
            qs = qs.filter(role=role_filter)
        if event_filter:
            qs = qs.filter(event=event_filter)
        if user_filter:
            qs = qs.filter(user__username__icontains=user_filter)

        limit = 50
        if limit_raw:
            try:
                limit = max(1, min(200, int(limit_raw)))
            except Exception:
                limit = 50

        serializer = UserActivitySerializer(qs[:limit], many=True)
        return Response(serializer.data)
