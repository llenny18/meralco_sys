import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import LeaderQiWorkload from '@/leader/leader-qi-workload';

function LeaderQiWorkloadPage() {
  return (
    <>
      <Head>
        <title>QI Workload Analysis - Team Leader</title>
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
            <LeaderQiWorkload />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

LeaderQiWorkloadPage.getLayout = (page) => (
  <SidebarLayout userRole="leader">{page}</SidebarLayout>
);

export default LeaderQiWorkloadPage;
