import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import SupervisorWorkflow from '@/supervisor/supervisor-workflow';

function SupervisorWorkflowPage() {
  return (
    <>
      <Head>
        <title>Workflow Management - WO Supervisor</title>
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
            <SupervisorWorkflow />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

SupervisorWorkflowPage.getLayout = (page) => (
  <SidebarLayout userRole="supervisor">{page}</SidebarLayout>
);

export default SupervisorWorkflowPage;
