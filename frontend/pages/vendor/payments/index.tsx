import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import VendorPayments from '@/vendor/vendor-payments';

function VendorPaymentsPage() {
  return (
    <>
      <Head>
        <title>Payments - Vendor Portal</title>
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
            <VendorPayments />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

VendorPaymentsPage.getLayout = (page) => (
  <SidebarLayout userRole="vendor">{page}</SidebarLayout>
);

export default VendorPaymentsPage;
