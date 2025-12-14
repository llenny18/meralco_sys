import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import SupervisorMilestones from '@/engineer/supervisor-milestones';

function SupervisorMilestonesPage() {
  return (
    <>
      <Head>
        <title>Project Milestones - WO Supervisor</title>
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
            <SupervisorMilestones />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

SupervisorMilestonesPage.getLayout = (page) => (
  <SidebarLayout userRole="supervisor">{page}</SidebarLayout>
);

export default SupervisorMilestonesPage;
