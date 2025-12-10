import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import LeaderPermissions from '@/leader/leader-permissions';

function LeaderPermissionsPage() {
  return (
    <>
      <Head>
        <title>Permissions - Team Leader</title>
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
            <LeaderPermissions />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

LeaderPermissionsPage.getLayout = (page) => (
  <SidebarLayout userRole="leader">{page}</SidebarLayout>
);

export default LeaderPermissionsPage;
