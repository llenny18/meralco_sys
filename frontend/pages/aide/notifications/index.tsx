import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import AideNotifications from '@/aide/aide-notifications';

function AideNotificationsPage() {
  return (
    <>
      <Head>
        <title>Notifications - Engineering Aide</title>
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
            <AideNotifications />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

AideNotificationsPage.getLayout = (page) => (
  <SidebarLayout userRole="aide">{page}</SidebarLayout>
);

export default AideNotificationsPage;
