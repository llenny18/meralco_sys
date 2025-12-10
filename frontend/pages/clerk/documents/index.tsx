import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import ClerkDocuments from '@/clerk/clerk-documents';

function ClerkDocumentsPage() {
  return (
    <>
      <Head>
        <title>Documents - Clerk Portal</title>
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
            <ClerkDocuments />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

ClerkDocumentsPage.getLayout = (page) => (
  <SidebarLayout userRole="clerk">{page}</SidebarLayout>
);

export default ClerkDocumentsPage;
