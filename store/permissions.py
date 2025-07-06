from rest_framework import permissions
from rest_framework.permissions import BasePermission


class IsOwnerOrReadOnly(BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the owner of the object.
        return obj.user == request.user


class IsCustomerOwner(BasePermission):
    """
    Custom permission to only allow customers to access their own profile.
    """
    def has_object_permission(self, request, view, obj):
        # Only allow access if the customer belongs to the requesting user
        return obj.user == request.user


class IsActivityOwner(BasePermission):
    """
    Custom permission to only allow users to view their own activity logs.
    """
    def has_object_permission(self, request, view, obj):
        # Only allow access if the activity belongs to the requesting user
        return obj.user == request.user


class IsShippingAddressOwner(BasePermission):
    """
    Custom permission to only allow customers to access their own shipping addresses.
    """
    def has_object_permission(self, request, view, obj):
        # Only allow access if the shipping address belongs to the requesting user's customer
        return obj.customer.user == request.user


class IsOrderOwner(BasePermission):
    """
    Custom permission to only allow customers to access their own orders.
    """
    def has_object_permission(self, request, view, obj):
        # Only allow access if the order belongs to the requesting user's customer
        return obj.customer.user == request.user


class IsAuthenticatedOrReadOnly(BasePermission):
    """
    Custom permission to allow read-only access to anonymous users
    and full access to authenticated users.
    """
    def has_permission(self, request, view):
        # Allow read-only access to anonymous users
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Require authentication for write operations
        return request.user and request.user.is_authenticated


class RateLimitedPermission(BasePermission):
    """
    Custom permission to implement basic rate limiting for sensitive operations.
    """
    def has_permission(self, request, view):
        # This is a placeholder for rate limiting logic
        # In a real implementation, you'd integrate with Django's cache framework
        # or a third-party rate limiting solution like django-ratelimit
        return request.user and request.user.is_authenticated