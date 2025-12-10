import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import EngineerDocuments from '@/engineer/engineer-documents';

function EngineerDocumentsPage() {
  return (
    <>
      <Head>
        <title>Documents - Engineer Portal</title>
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
            <EngineerDocuments />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

EngineerDocumentsPage.getLayout = (page) => (
  <SidebarLayout userRole="engineer">{page}</SidebarLayout>
);

export default EngineerDocumentsPage;
