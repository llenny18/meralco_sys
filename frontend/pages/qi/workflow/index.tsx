import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import QiWorkflow from '@/qi/qi-workflow';

function QiWorkflowPage() {
  return (
    <>
      <Head>
        <title>Workflow - Quality Inspector</title>
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
            <QiWorkflow />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

QiWorkflowPage.getLayout = (page) => (
  <SidebarLayout userRole="qi">{page}</SidebarLayout>
);

export default QiWorkflowPage;
