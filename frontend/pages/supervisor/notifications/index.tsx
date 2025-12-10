import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import SupervisorNotifications from '@/supervisor/supervisor-notifications';

function SupervisorNotificationsPage() {
  return (
    <>
      <Head>
        <title>Notifications - WO Supervisor</title>
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
            <SupervisorNotifications />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

SupervisorNotificationsPage.getLayout = (page) => (
  <SidebarLayout userRole="supervisor">{page}</SidebarLayout>
);

export default SupervisorNotificationsPage;
