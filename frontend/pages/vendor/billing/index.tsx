import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import VendorBilling from '@/vendor/vendor-billing';

function VendorBillingPage() {
  return (
    <>
      <Head>
        <title>Billing Summary - Vendor Portal</title>
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
            <VendorBilling />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

VendorBillingPage.getLayout = (page) => (
  <SidebarLayout userRole="vendor">{page}</SidebarLayout>
);

export default VendorBillingPage;
