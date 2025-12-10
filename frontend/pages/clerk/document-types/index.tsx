import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import ClerkDocumentTypes from '@/clerk/clerk-document-types';

function ClerkDocumentTypesPage() {
  return (
    <>
      <Head>
        <title>Document Types - Clerk Portal</title>
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
            <ClerkDocumentTypes />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

ClerkDocumentTypesPage.getLayout = (page) => (
  <SidebarLayout userRole="clerk">{page}</SidebarLayout>
);

export default ClerkDocumentTypesPage;
