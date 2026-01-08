from django.core.management.base import BaseCommand
from meralcoapp.models import UserRole, Permission, RolePermission

class Command(BaseCommand):
    help = 'Seed permissions for all user roles'

    def handle(self, *args, **kwargs):
        # Define permissions by module
        permissions_data = {
            # Document Management
            'documents': [
                ('view_documents', 'View Documents', 'documents'),
                ('upload_documents', 'Upload Documents', 'documents'),
                ('approve_documents', 'Approve Documents', 'documents'),
                ('delete_documents', 'Delete Documents', 'documents'),
            ],
            # Project Management
            'projects': [
                ('view_projects', 'View Projects', 'projects'),
                ('create_projects', 'Create Projects', 'projects'),
                ('edit_projects', 'Edit Projects', 'projects'),
                ('delete_projects', 'Delete Projects', 'projects'),
                ('approve_projects', 'Approve Projects', 'projects'),
            ],
            # Quality Inspection
            'inspections': [
                ('view_inspections', 'View Inspections', 'inspections'),
                ('create_inspections', 'Create Inspections', 'inspections'),
                ('complete_inspections', 'Complete Inspections', 'inspections'),
                ('approve_inspections', 'Approve Inspections', 'inspections'),
            ],
            # Penalties
            'penalties': [
                ('view_penalties', 'View Penalties', 'penalties'),
                ('create_penalties', 'Create Penalties', 'penalties'),
                ('approve_penalties', 'Approve Penalties', 'penalties'),
                ('waive_penalties', 'Waive Penalties', 'penalties'),
            ],
            # Billing
            'billing': [
                ('view_invoices', 'View Invoices', 'billing'),
                ('create_invoices', 'Create Invoices', 'billing'),
                ('approve_invoices', 'Approve Invoices', 'billing'),
                ('process_payments', 'Process Payments', 'billing'),
            ],
            # Analytics
            'analytics': [
                ('view_analytics', 'View Analytics', 'analytics'),
                ('view_reports', 'View Reports', 'analytics'),
                ('export_data', 'Export Data', 'analytics'),
                ('view_kpi_dashboard', 'View KPI Dashboard', 'analytics'),
            ],
            # User Management
            'users': [
                ('view_users', 'View Users', 'users'),
                ('create_users', 'Create Users', 'users'),
                ('edit_users', 'Edit Users', 'users'),
                ('delete_users', 'Delete Users', 'users'),
                ('manage_roles', 'Manage Roles', 'users'),
            ],
            # Vendor Management
            'vendors': [
                ('view_vendors', 'View Vendors', 'vendors'),
                ('create_vendors', 'Create Vendors', 'vendors'),
                ('edit_vendors', 'Edit Vendors', 'vendors'),
                ('blacklist_vendors', 'Blacklist Vendors', 'vendors'),
            ],
            # Notifications
            'notifications': [
                ('send_notifications', 'Send Notifications', 'notifications'),
                ('view_notifications', 'View Notifications', 'notifications'),
            ],
            # System Settings
            'system': [
                ('view_audit_logs', 'View Audit Logs', 'system'),
                ('manage_settings', 'Manage System Settings', 'system'),
                ('backup_database', 'Backup Database', 'system'),
            ],
        }

        # Create permissions
        self.stdout.write('Creating permissions...')
        for module, perms in permissions_data.items():
            for perm_name, perm_desc, module_name in perms:
                permission, created = Permission.objects.get_or_create(
                    permission_name=perm_name,
                    defaults={
                        'permission_description': perm_desc,
                        'module_name': module_name
                    }
                )
                if created:
                    self.stdout.write(f'  ✓ Created: {perm_name}')

        # Define role permissions mapping
        role_permissions = {
            'System Administrator': 'all',  # All permissions
            
            'Vendor Representative': [
                'view_projects', 'view_documents', 'upload_documents',
                'view_invoices', 'view_penalties', 'view_notifications'
            ],
            
            'Clerk': [
                'view_projects', 'view_documents', 'upload_documents',
                'send_notifications', 'view_notifications'
            ],
            
            'Engineering Aide': [
                'view_projects', 'view_documents', 'upload_documents',
                'view_analytics', 'view_reports', 'send_notifications',
                'view_notifications'
            ],
            
            'Quality Inspector': [
                'view_projects', 'view_inspections', 'create_inspections',
                'complete_inspections', 'view_documents', 'upload_documents',
                'view_notifications'
            ],
            
            'Engineer': [
                'view_projects', 'edit_projects', 'approve_projects',
                'view_documents', 'approve_documents', 'view_inspections',
                'approve_inspections', 'view_analytics', 'view_reports',
                'view_vendors', 'view_notifications'
            ],
            
            'WO Supervisor': [
                'view_projects', 'create_projects', 'edit_projects',
                'view_documents', 'upload_documents', 'approve_documents',
                'view_inspections', 'create_inspections', 'approve_inspections',
                'view_penalties', 'create_penalties', 'view_invoices',
                'view_analytics', 'view_reports', 'export_data',
                'view_vendors', 'view_notifications', 'send_notifications'
            ],
            
            'Team Leader': [
                'view_projects', 'create_projects', 'edit_projects', 'approve_projects',
                'view_documents', 'approve_documents', 'delete_documents',
                'view_inspections', 'approve_inspections',
                'view_penalties', 'create_penalties', 'approve_penalties', 'waive_penalties',
                'view_invoices', 'approve_invoices',
                'view_analytics', 'view_reports', 'export_data', 'view_kpi_dashboard',
                'view_vendors', 'edit_vendors',
                'view_users', 'edit_users',
                'view_notifications', 'send_notifications'
            ],
            
            'Sector Manager': [
                'view_projects', 'approve_projects',
                'view_documents', 'approve_documents',
                'view_inspections', 'approve_inspections',
                'view_penalties', 'approve_penalties', 'waive_penalties',
                'view_invoices', 'approve_invoices',
                'view_analytics', 'view_reports', 'export_data', 'view_kpi_dashboard',
                'view_vendors', 'edit_vendors', 'blacklist_vendors',
                'view_users',
                'view_notifications'
            ],
        }

        # Assign permissions to roles
        self.stdout.write('\nAssigning permissions to roles...')
        for role_name, permissions in role_permissions.items():
            try:
                role = UserRole.objects.get(role_name=role_name)
                
                if permissions == 'all':
                    # System admin gets all permissions
                    all_permissions = Permission.objects.all()
                    for perm in all_permissions:
                        RolePermission.objects.get_or_create(
                            role=role,
                            permission=perm
                        )
                    self.stdout.write(f'  ✓ {role_name}: ALL permissions')
                else:
                    # Assign specific permissions
                    for perm_name in permissions:
                        try:
                            perm = Permission.objects.get(permission_name=perm_name)
                            RolePermission.objects.get_or_create(
                                role=role,
                                permission=perm
                            )
                        except Permission.DoesNotExist:
                            self.stdout.write(f'  ✗ Permission not found: {perm_name}')
                    self.stdout.write(f'  ✓ {role_name}: {len(permissions)} permissions')
                    
            except UserRole.DoesNotExist:
                self.stdout.write(f'  ✗ Role not found: {role_name}')

        self.stdout.write(self.style.SUCCESS('\n✓ Permission seeding completed!'))