import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import LeaderUserRoles from '@/leader/leader-user-roles';

function LeaderUserRolesPage() {
  return (
    <>
      <Head>
        <title>User Roles - Team Leader</title>
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
            <LeaderUserRoles />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

LeaderUserRolesPage.getLayout = (page) => (
  <SidebarLayout userRole="leader">{page}</SidebarLayout>
);

export default LeaderUserRolesPage;
