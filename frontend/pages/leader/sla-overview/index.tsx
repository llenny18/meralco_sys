import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import LeaderSlaOverview from '@/leader/leader-sla-overview';

function LeaderSlaOverviewPage() {
  return (
    <>
      <Head>
        <title>SLA Overview - Team Leader</title>
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
            <LeaderSlaOverview />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

LeaderSlaOverviewPage.getLayout = (page) => (
  <SidebarLayout userRole="leader">{page}</SidebarLayout>
);

export default LeaderSlaOverviewPage;
