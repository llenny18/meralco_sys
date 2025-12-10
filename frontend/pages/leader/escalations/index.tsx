import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import LeaderEscalations from '@/leader/leader-escalations';

function LeaderEscalationsPage() {
  return (
    <>
      <Head>
        <title>Escalation Management - Team Leader</title>
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
            <LeaderEscalations />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

LeaderEscalationsPage.getLayout = (page) => (
  <SidebarLayout userRole="leader">{page}</SidebarLayout>
);

export default LeaderEscalationsPage;
