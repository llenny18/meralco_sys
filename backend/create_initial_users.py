# Save this as: your_app/management/commands/create_initial_users.py

from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from meralcoapp.models import User, UserRole  # Replace 'your_app' with your actual app name


class Command(BaseCommand):
    help = 'Creates initial user roles and users for testing'

    def handle(self, *args, **kwargs):
        # Create User Roles
        roles_data = [
            {'role_name': 'admin', 'role_description': 'System Administrator'},
            {'role_name': 'team-leader', 'role_description': 'Team Leader'},
            {'role_name': 'sector-manager', 'role_description': 'Sector Manager'},
            {'role_name': 'engineer', 'role_description': 'Engineer'},
            {'role_name': 'vendor', 'role_description': 'Vendor'},
            {'role_name': 'quality-inspector', 'role_description': 'Quality Inspector'},
            {'role_name': 'clerk', 'role_description': 'Clerk'},
            {'role_name': 'engineering-aide', 'role_description': 'Engineering Aide'},
            {'role_name': 'supervisor', 'role_description': 'Supervisor'},
        ]

        self.stdout.write('Creating user roles...')
        for role_data in roles_data:
            role, created = UserRole.objects.get_or_create(
                role_name=role_data['role_name'],
                defaults={'role_description': role_data['role_description']}
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'✓ Created role: {role.role_name}'))
            else:
                self.stdout.write(self.style.WARNING(f'- Role already exists: {role.role_name}'))

        # Create Users
        users_data = [
            {
                'username': 'admin',
                'password': 'admin123',
                'first_name': 'System',
                'last_name': 'Administrator',
                'email': 'admin@meralco.com',
                'role_name': 'admin'
            },
            {
                'username': 'teamlead',
                'password': 'lead123',
                'first_name': 'Team',
                'last_name': 'Leader',
                'email': 'teamlead@meralco.com',
                'role_name': 'team-leader'
            },
            {
                'username': 'sector',
                'password': 'sector123',
                'first_name': 'Sector',
                'last_name': 'Manager',
                'email': 'sector@meralco.com',
                'role_name': 'sector-manager'
            },
            {
                'username': 'engineer',
                'password': 'eng123',
                'first_name': 'John',
                'last_name': 'Engineer',
                'email': 'engineer@meralco.com',
                'role_name': 'engineer'
            },
            {
                'username': 'vendor',
                'password': 'vendor123',
                'first_name': 'Vendor',
                'last_name': 'User',
                'email': 'vendor@meralco.com',
                'role_name': 'vendor'
            },
            {
                'username': 'qi',
                'password': 'qi123',
                'first_name': 'Quality',
                'last_name': 'Inspector',
                'email': 'qi@meralco.com',
                'role_name': 'quality-inspector'
            },
            {
                'username': 'clerk',
                'password': 'clerk123',
                'first_name': 'Office',
                'last_name': 'Clerk',
                'email': 'clerk@meralco.com',
                'role_name': 'clerk'
            },
            {
                'username': 'aide',
                'password': 'aide123',
                'first_name': 'Engineering',
                'last_name': 'Aide',
                'email': 'aide@meralco.com',
                'role_name': 'engineering-aide'
            },
            {
                'username': 'supervisor',
                'password': 'super123',
                'first_name': 'Site',
                'last_name': 'Supervisor',
                'email': 'supervisor@meralco.com',
                'role_name': 'supervisor'
            },
        ]

        self.stdout.write('\nCreating users...')
        for user_data in users_data:
            try:
                role = UserRole.objects.get(role_name=user_data['role_name'])
                
                if User.objects.filter(username=user_data['username']).exists():
                    self.stdout.write(self.style.WARNING(f'- User already exists: {user_data["username"]}'))
                    continue
                
                user = User.objects.create(
                    username=user_data['username'],
                    first_name=user_data['first_name'],
                    last_name=user_data['last_name'],
                    email=user_data['email'],
                    role=role,
                    is_active=True,
                    is_staff=user_data['role_name'] == 'admin',
                    is_super_user=user_data['role_name'] == 'admin'
                )
                user.set_password(user_data['password'])
                user.save()
                
                self.stdout.write(self.style.SUCCESS(
                    f'✓ Created user: {user.username} ({role.role_name})'
                ))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'✗ Error creating user {user_data["username"]}: {str(e)}'))

        self.stdout.write('\n' + self.style.SUCCESS('Initial setup completed!'))
        self.stdout.write('\nTest Credentials:')
        for user_data in users_data:
            self.stdout.write(f'  {user_data["username"]} / {user_data["password"]} ({user_data["role_name"]})')