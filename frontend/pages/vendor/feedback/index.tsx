import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import VendorFeedback from '@/vendor/vendor-feedback';

function VendorFeedbackPage() {
  return (
    <>
      <Head>
        <title>Feedback - Vendor Portal</title>
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
            <VendorFeedback />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

VendorFeedbackPage.getLayout = (page) => (
  <SidebarLayout userRole="vendor">{page}</SidebarLayout>
);

export default VendorFeedbackPage;
