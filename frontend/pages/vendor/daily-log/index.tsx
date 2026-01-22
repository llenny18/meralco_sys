import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import VendorActivityDashboard from '@/vendor/daily-log';

function VendorActivityDashboardPage() {
  return (
    <>
      <Head>
        <title>Daily Login - Vendor Portal</title>
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
            <VendorActivityDashboard />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

VendorActivityDashboardPage.getLayout = (page) => (
  <SidebarLayout userRole="vendor">{page}</SidebarLayout>
);

export default VendorActivityDashboardPage;
