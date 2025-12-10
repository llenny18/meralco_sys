import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import LeaderQiOverview from '@/leader/leader-qi-overview';

function LeaderQiOverviewPage() {
  return (
    <>
      <Head>
        <title>QI Performance Overview - Team Leader</title>
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
            <LeaderQiOverview />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

LeaderQiOverviewPage.getLayout = (page) => (
  <SidebarLayout userRole="leader">{page}</SidebarLayout>
);

export default LeaderQiOverviewPage;
