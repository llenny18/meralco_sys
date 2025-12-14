import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import SupervisorDocumentTypes from '@/engineer/supervisor-document-types';

function SupervisorDocumentTypesPage() {
  return (
    <>
      <Head>
        <title>Document Types - WO Supervisor</title>
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
            <SupervisorDocumentTypes />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

SupervisorDocumentTypesPage.getLayout = (page) => (
  <SidebarLayout userRole="supervisor">{page}</SidebarLayout>
);

export default SupervisorDocumentTypesPage;
