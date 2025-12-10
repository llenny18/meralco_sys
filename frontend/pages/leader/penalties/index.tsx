import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import LeaderPenalties from '@/leader/leader-penalties';

function LeaderPenaltiesPage() {
  return (
    <>
      <Head>
        <title>Penalty Overview - Team Leader</title>
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
            <LeaderPenalties />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

LeaderPenaltiesPage.getLayout = (page) => (
  <SidebarLayout userRole="leader">{page}</SidebarLayout>
);

export default LeaderPenaltiesPage;
