import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import SupervisorDocuments from '@/engineer/supervisor-documents';

function SupervisorDocumentsPage() {
  return (
    <>
      <Head>
        <title>Project Documents - WO Supervisor</title>
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
            <SupervisorDocuments />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

SupervisorDocumentsPage.getLayout = (page) => (
  <SidebarLayout userRole="supervisor">{page}</SidebarLayout>
);

export default SupervisorDocumentsPage;
