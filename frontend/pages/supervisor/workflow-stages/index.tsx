import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import SupervisorWorkflowStages from '@/supervisor/supervisor-workflow-stages';

function SupervisorWorkflowStagesPage() {
  return (
    <>
      <Head>
        <title>Workflow Stages - WO Supervisor</title>
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
            <SupervisorWorkflowStages />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

SupervisorWorkflowStagesPage.getLayout = (page) => (
  <SidebarLayout userRole="supervisor">{page}</SidebarLayout>
);

export default SupervisorWorkflowStagesPage;
