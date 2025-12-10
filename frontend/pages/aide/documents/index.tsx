import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import AideDocuments from '@/aide/aide-documents';

function AideDocumentsPage() {
  return (
    <>
      <Head>
        <title>Documents - Engineering Aide</title>
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
            <AideDocuments />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

AideDocumentsPage.getLayout = (page) => (
  <SidebarLayout userRole="aide">{page}</SidebarLayout>
);

export default AideDocumentsPage;
