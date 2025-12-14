import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import EngineerWorkflow from '@/engineer/old/engineer-workflow';

function EngineerWorkflowPage() {
  return (
    <>
      <Head>
        <title>Workflow - Engineer Portal</title>
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
            <EngineerWorkflow />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

EngineerWorkflowPage.getLayout = (page) => (
  <SidebarLayout userRole="engineer">{page}</SidebarLayout>
);

export default EngineerWorkflowPage;
