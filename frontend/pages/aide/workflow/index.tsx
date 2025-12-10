import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import AideWorkflow from '@/aide/aide-workflow';

function AideWorkflowPage() {
  return (
    <>
      <Head>
        <title>Workflow - Engineering Aide</title>
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
            <AideWorkflow />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

AideWorkflowPage.getLayout = (page) => (
  <SidebarLayout userRole="aide">{page}</SidebarLayout>
);

export default AideWorkflowPage;
