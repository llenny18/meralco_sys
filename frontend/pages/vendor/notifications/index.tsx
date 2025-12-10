import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import VendorNotifications from '@/vendor/vendor-notifications';

function VendorNotificationsPage() {
  return (
    <>
      <Head>
        <title>Notifications - Vendor Portal</title>
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
            <VendorNotifications />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

VendorNotificationsPage.getLayout = (page) => (
  <SidebarLayout userRole="vendor">{page}</SidebarLayout>
);

export default VendorNotificationsPage;
