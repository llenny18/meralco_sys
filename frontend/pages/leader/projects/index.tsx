import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import LeaderProjects from '@/leader/leader-projects';

function LeaderProjectsPage() {
  return (
    <>
      <Head>
        <title>All Projects - Team Leader</title>
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
            <LeaderProjects />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

LeaderProjectsPage.getLayout = (page) => (
  <SidebarLayout userRole="leader">{page}</SidebarLayout>
);

export default LeaderProjectsPage;
