import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import LeaderDelayAnalysis from '@/leader/leader-delay-analysis';

function LeaderDelayAnalysisPage() {
  return (
    <>
      <Head>
        <title>Delay Analysis - Team Leader</title>
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
            <LeaderDelayAnalysis />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

LeaderDelayAnalysisPage.getLayout = (page) => (
  <SidebarLayout userRole="leader">{page}</SidebarLayout>
);

export default LeaderDelayAnalysisPage;
