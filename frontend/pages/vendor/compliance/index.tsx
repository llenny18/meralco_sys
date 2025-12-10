import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import VendorCompliance from '@/vendor/vendor-compliance';

function VendorCompliancePage() {
  return (
    <>
      <Head>
        <title>Document Compliance - Vendor Portal</title>
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
            <VendorCompliance />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

VendorCompliancePage.getLayout = (page) => (
  <SidebarLayout userRole="vendor">{page}</SidebarLayout>
);

export default VendorCompliancePage;
