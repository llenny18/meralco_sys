import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import SupervisorNotificationTemplates from '@/supervisor/supervisor-notification-templates';

function SupervisorNotificationTemplatesPage() {
  return (
    <>
      <Head>
        <title>Notification Templates - WO Supervisor</title>
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
            <SupervisorNotificationTemplates />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

SupervisorNotificationTemplatesPage.getLayout = (page) => (
  <SidebarLayout userRole="supervisor">{page}</SidebarLayout>
);

export default SupervisorNotificationTemplatesPage;
