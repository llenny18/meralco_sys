import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import LeaderVendorAnalytics from '@/leader/leader-vendor-analytics';

function LeaderVendorAnalyticsPage() {
  return (
    <>
      <Head>
        <title>Vendor Analytics - Team Leader</title>
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
            <LeaderVendorAnalytics />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

LeaderVendorAnalyticsPage.getLayout = (page) => (
  <SidebarLayout userRole="leader">{page}</SidebarLayout>
);

export default LeaderVendorAnalyticsPage;
