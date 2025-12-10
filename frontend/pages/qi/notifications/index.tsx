import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import QiNotifications from '@/qi/qi-notifications';

function QiNotificationsPage() {
  return (
    <>
      <Head>
        <title>Notifications - Quality Inspector</title>
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
            <QiNotifications />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

QiNotificationsPage.getLayout = (page) => (
  <SidebarLayout userRole="qi">{page}</SidebarLayout>
);

export default QiNotificationsPage;
