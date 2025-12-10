import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import VendorDisputes from '@/vendor/vendor-disputes';

function VendorDisputesPage() {
  return (
    <>
      <Head>
        <title>Disputes - Vendor Portal</title>
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
            <VendorDisputes />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

VendorDisputesPage.getLayout = (page) => (
  <SidebarLayout userRole="vendor">{page}</SidebarLayout>
);

export default VendorDisputesPage;
