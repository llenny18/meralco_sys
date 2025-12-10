import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import LeaderRolePermissions from '@/leader/leader-role-permissions';

function LeaderRolePermissionsPage() {
  return (
    <>
      <Head>
        <title>Role Permissions - Team Leader</title>
      </Head>
      <Container maxWidth="lg">
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="stretch"
          spacing={3}
        >
          <Grid item xs={12}>
            <LeaderRolePermissions />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

LeaderRolePermissionsPage.getLayout = (page) => (
  <SidebarLayout userRole="leader">{page}</SidebarLayout>
);

export default LeaderRolePermissionsPage;
