#!/usr/bin/env python3
"""
Script to generate Next.js page wrappers with index.tsx structure
Creates: frontend/pages/{role}/{page-name}/index.tsx
"""

import os
import re

# Page wrapper template - simple wrapper for CRUD components
PAGE_TEMPLATE = """import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import {{ Grid, Container }} from '@mui/material';

import {component_name} from '@/content/{role}/{component_file}';

function {page_function_name}() {{
  return (
    <>
      <Head>
        <title>{page_title} - {role_name}</title>
      </Head>
      <Container maxWidth="lg">
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="stretch"
          spacing={{3}}
        >
          <Grid item xs={{12}}>
            <{component_name} />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}}

{page_function_name}.getLayout = (page) => (
  <SidebarLayout userRole="{role}">{{page}}</SidebarLayout>
);

export default {page_function_name};
"""

# Role page configurations - now creates folders
ROLE_PAGES = {
    'vendor': [
        {'folder': 'projects', 'title': 'My Projects'},
        {'folder': 'documents', 'title': 'Document Upload'},
        {'folder': 'compliance', 'title': 'Document Compliance'},
        {'folder': 'billing', 'title': 'Billing Summary'},
        {'folder': 'payments', 'title': 'Payments'},
        {'folder': 'disputes', 'title': 'Disputes'},
        {'folder': 'feedback', 'title': 'Feedback'},
        {'folder': 'notifications', 'title': 'Notifications'},
    ],
    
    'clerk': [
        {'folder': 'projects', 'title': 'Projects'},
        {'folder': 'documents', 'title': 'Documents'},
        {'folder': 'document-types', 'title': 'Document Types'},
        {'folder': 'compliance', 'title': 'Document Compliance'},
        {'folder': 'notifications', 'title': 'Notifications'},
        {'folder': 'change-logs', 'title': 'Change Logs'},
    ],
    
    'aide': [
        {'folder': 'projects', 'title': 'Projects'},
        {'folder': 'workflow', 'title': 'Workflow'},
        {'folder': 'workflow-stages', 'title': 'Workflow Stages'},
        {'folder': 'documents', 'title': 'Documents'},
        {'folder': 'compliance', 'title': 'Document Compliance'},
        {'folder': 'notifications', 'title': 'Notifications'},
        {'folder': 'change-logs', 'title': 'Change History'},
    ],
    
    'qi': [
        {'folder': 'inspections', 'title': 'My Inspections'},
        {'folder': 'inspection-types', 'title': 'Inspection Types'},
        {'folder': 'daily-targets', 'title': 'Daily Targets'},
        {'folder': 'performance', 'title': 'Performance'},
        {'folder': 'projects', 'title': 'Projects'},
        {'folder': 'workflow', 'title': 'Workflow'},
        {'folder': 'notifications', 'title': 'Notifications'},
    ],
    
    'engineer': [
        {'folder': 'projects', 'title': 'Projects'},
        {'folder': 'milestones', 'title': 'Project Milestones'},
        {'folder': 'documents', 'title': 'Documents'},
        {'folder': 'workflow', 'title': 'Workflow'},
        {'folder': 'sla-tracking', 'title': 'SLA Tracking'},
        {'folder': 'vendor-performance', 'title': 'Vendor Performance'},
        {'folder': 'change-logs', 'title': 'Change History'},
    ],
    
    'supervisor': [
        {'folder': 'projects', 'title': 'All Projects'},
        {'folder': 'milestones', 'title': 'Project Milestones'},
        {'folder': 'project-team', 'title': 'Project Team'},
        {'folder': 'project-delays', 'title': 'Project Delays'},
        {'folder': 'workflow', 'title': 'Workflow Management'},
        {'folder': 'workflow-stages', 'title': 'Workflow Stages'},
        {'folder': 'sla-rules', 'title': 'SLA Rules'},
        {'folder': 'sla-tracking', 'title': 'SLA Tracking'},
        {'folder': 'compliance', 'title': 'Document Compliance'},
        {'folder': 'penalty-rules', 'title': 'Penalty Rules'},
        {'folder': 'penalties', 'title': 'Penalties'},
        {'folder': 'qi-inspections', 'title': 'QI Inspections'},
        {'folder': 'qi-targets', 'title': 'QI Daily Targets'},
        {'folder': 'qi-performance', 'title': 'QI Performance'},
        {'folder': 'vendors', 'title': 'Vendors'},
        {'folder': 'vendor-performance', 'title': 'Vendor Performance'},
        {'folder': 'vendor-disputes', 'title': 'Vendor Disputes'},
        {'folder': 'vendor-feedback', 'title': 'Vendor Feedback'},
        {'folder': 'invoices', 'title': 'Invoices'},
        {'folder': 'payments', 'title': 'Payments'},
        {'folder': 'escalation-rules', 'title': 'Escalation Rules'},
        {'folder': 'escalations', 'title': 'Escalations'},
        {'folder': 'delay-factors', 'title': 'Delay Factors'},
        {'folder': 'documents', 'title': 'Project Documents'},
        {'folder': 'document-types', 'title': 'Document Types'},
        {'folder': 'notifications', 'title': 'Notifications'},
        {'folder': 'notification-templates', 'title': 'Notification Templates'},
        {'folder': 'change-logs', 'title': 'Change Logs'},
        {'folder': 'audit-logs', 'title': 'Audit Logs'},
    ],
    
    'leader': [
        {'folder': 'projects', 'title': 'All Projects'},
        {'folder': 'sectors', 'title': 'Sectors'},
        {'folder': 'project-status', 'title': 'Project Status'},
        {'folder': 'vendor-analytics', 'title': 'Vendor Analytics'},
        {'folder': 'delay-analysis', 'title': 'Delay Analysis'},
        {'folder': 'sla-overview', 'title': 'SLA Overview'},
        {'folder': 'sla-rules', 'title': 'SLA Rules Management'},
        {'folder': 'penalties', 'title': 'Penalty Overview'},
        {'folder': 'penalty-rules', 'title': 'Penalty Rules'},
        {'folder': 'billing', 'title': 'Billing Overview'},
        {'folder': 'qi-overview', 'title': 'QI Performance Overview'},
        {'folder': 'qi-workload', 'title': 'QI Workload Analysis'},
        {'folder': 'escalations', 'title': 'Escalation Management'},
        {'folder': 'escalation-rules', 'title': 'Escalation Rules'},
        {'folder': 'users', 'title': 'Users'},
        {'folder': 'user-roles', 'title': 'User Roles'},
        {'folder': 'permissions', 'title': 'Permissions'},
        {'folder': 'role-permissions', 'title': 'Role Permissions'},
        {'folder': 'vendors', 'title': 'Vendor Management'},
        {'folder': 'vendor-contacts', 'title': 'Vendor Contacts'},
        {'folder': 'change-logs', 'title': 'Change Logs'},
        {'folder': 'audit-logs', 'title': 'Audit Logs'},
    ],
    
    'sector-manager': [
        {'folder': 'sectors', 'title': 'Sector Overview'},
        {'folder': 'projects', 'title': 'Project Portfolio'},
        {'folder': 'vendor-performance', 'title': 'Vendor Performance'},
        {'folder': 'sla', 'title': 'SLA Compliance'},
        {'folder': 'financial', 'title': 'Financial Overview'},
        {'folder': 'penalties', 'title': 'Penalties Overview'},
    ],
}


def to_pascal_case(text):
    """Convert kebab-case or snake_case to PascalCase"""
    return ''.join(word.capitalize() for word in re.split(r'[-_]', text))


def get_role_name(role):
    """Get display name for role"""
    role_names = {
        'vendor': 'Vendor Portal',
        'clerk': 'Clerk Portal',
        'aide': 'Engineering Aide',
        'qi': 'Quality Inspector',
        'engineer': 'Engineer Portal',
        'supervisor': 'WO Supervisor',
        'leader': 'Team Leader',
        'sector-manager': 'Sector Manager'
    }
    return role_names.get(role, role.title())


def generate_page_wrapper(config, role):
    """Generate a page wrapper that imports the CRUD component"""
    folder_name = config['folder']
    
    # Component name: role + folder in PascalCase
    # e.g., vendor + projects = VendorProjects
    component_name = to_pascal_case(role) + to_pascal_case(folder_name)
    
    # Page function name
    page_function_name = component_name + 'Page'
    
    # Component file path: role-folder-name
    # e.g., vendor-projects
    component_file = f"{role}-{folder_name}"
    
    # Generate the page content
    content = PAGE_TEMPLATE.format(
        component_name=component_name,
        component_file=component_file,
        page_function_name=page_function_name,
        page_title=config['title'],
        role_name=get_role_name(role),
        role=role
    )
    
    return content


def main():
    """Main function to generate all page wrappers with folder structure"""
    # Base output directory
    base_output_dir = 'frontend/pages'
    
    # Create base pages directory if it doesn't exist
    if not os.path.exists(base_output_dir):
        os.makedirs(base_output_dir)
        print(f"✅ Created directory: {base_output_dir}")
    
    total_generated = 0
    
    # Generate pages for each role
    for role, pages in ROLE_PAGES.items():
        role_dir = os.path.join(base_output_dir, role)
        
        # Create role directory
        if not os.path.exists(role_dir):
            os.makedirs(role_dir)
            print(f"\n📁 Created directory: {role_dir}/")
        
        generated_count = 0
        
        # Generate each page with its own folder
        for config in pages:
            try:
                # Create page folder (e.g., frontend/pages/vendor/projects/)
                page_folder = os.path.join(role_dir, config['folder'])
                if not os.path.exists(page_folder):
                    os.makedirs(page_folder)
                
                # Generate content
                content = generate_page_wrapper(config, role)
                
                # Write to index.tsx
                filepath = os.path.join(page_folder, 'index.tsx')
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                generated_count += 1
                total_generated += 1
                print(f"  ✅ {config['folder']}/index.tsx")
                
            except Exception as e:
                print(f"  ❌ Error generating {config['folder']}/index.tsx: {str(e)}")
        
        print(f"  📊 Generated {generated_count}/{len(pages)} pages for {role}")
    
    # Print summary
    print(f"\n{'='*60}")
    print(f"🎉 PAGE GENERATION COMPLETE!")
    print(f"{'='*60}")
    print(f"Total page wrappers generated: {total_generated}")
    print(f"Roles processed: {len(ROLE_PAGES)}")
    print(f"Output directory: {base_output_dir}/")
    
    # Print folder structure example
    print(f"\n📂 Generated Folder Structure (Example):")
    print(f"frontend/pages/")
    for role in list(ROLE_PAGES.keys())[:3]:  # Show first 3 roles as example
        print(f"  ├── {role}/")
        for page in ROLE_PAGES[role][:3]:  # Show first 3 pages
            print(f"  │   ├── {page['folder']}/")
            print(f"  │   │   └── index.tsx")
        if len(ROLE_PAGES[role]) > 3:
            print(f"  │   └── ... ({len(ROLE_PAGES[role]) - 3} more)")
    print(f"  └── ... ({len(ROLE_PAGES) - 3} more roles)")
    
    # Print breakdown by role
    print(f"\n📋 Files by Role:")
    for role, pages in ROLE_PAGES.items():
        print(f"  • {get_role_name(role)}: {len(pages)} pages")
    
    print(f"\n📝 Next Steps:")
    print(f"1. Verify CRUD components exist in frontend/src/content/{{role}}/")
    print(f"2. Ensure SidebarLayout exists at frontend/src/layouts/SidebarLayout")
    print(f"3. Components should be named like: {role}-{{page}}.tsx")
    print(f"4. Test each role's pages by navigating to /{{role}}/{{page-name}}")
    
    print(f"\n💡 Example URLs:")
    print(f"  • /vendor/projects")
    print(f"  • /clerk/documents")
    print(f"  • /engineer/projects")
    print(f"  • /supervisor/penalties")
    
    print(f"\n📁 Example Component Paths:")
    print(f"  • frontend/src/content/vendor/vendor-projects.tsx")
    print(f"  • frontend/src/content/clerk/clerk-documents.tsx")
    print(f"  • frontend/src/content/engineer/engineer-projects.tsx")


if __name__ == '__main__':
    main()