import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import ClerkCompliance from '@/clerk/clerk-compliance';

function ClerkCompliancePage() {
  return (
    <>
      <Head>
        <title>Document Compliance - Clerk Portal</title>
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
            <ClerkCompliance />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

ClerkCompliancePage.getLayout = (page) => (
  <SidebarLayout userRole="clerk">{page}</SidebarLayout>
);

export default ClerkCompliancePage;
