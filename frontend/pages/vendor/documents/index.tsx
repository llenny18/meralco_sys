import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import VendorDocuments from '@/vendor/vendor-documents';

function VendorDocumentsPage() {
  return (
    <>
      <Head>
        <title>Document Upload - Vendor Portal</title>
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
            <VendorDocuments />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

VendorDocumentsPage.getLayout = (page) => (
  <SidebarLayout userRole="vendor">{page}</SidebarLayout>
);

export default VendorDocumentsPage;
