import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import LeaderProjectStatus from '@/leader/leader-project-status';

function LeaderProjectStatusPage() {
  return (
    <>
      <Head>
        <title>Project Status - Team Leader</title>
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
            <LeaderProjectStatus />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

LeaderProjectStatusPage.getLayout = (page) => (
  <SidebarLayout userRole="leader">{page}</SidebarLayout>
);

export default LeaderProjectStatusPage;
