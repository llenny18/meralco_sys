import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import SupervisorProjectTeam from '@/engineer/supervisor-project-team';

function SupervisorProjectTeamPage() {
  return (
    <>
      <Head>
        <title>Project Team - WO Supervisor</title>
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
            <SupervisorProjectTeam />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

SupervisorProjectTeamPage.getLayout = (page) => (
  <SidebarLayout userRole="supervisor">{page}</SidebarLayout>
);

export default SupervisorProjectTeamPage;
