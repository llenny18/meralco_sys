import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import AideWorkflowStages from '@/aide/aide-workflow-stages';

function AideWorkflowStagesPage() {
  return (
    <>
      <Head>
        <title>Workflow Stages - Engineering Aide</title>
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
            <AideWorkflowStages />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

AideWorkflowStagesPage.getLayout = (page) => (
  <SidebarLayout userRole="aide">{page}</SidebarLayout>
);

export default AideWorkflowStagesPage;
