import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import AideCompliance from '@/aide/aide-compliance';

function AideCompliancePage() {
  return (
    <>
      <Head>
        <title>Document Compliance - Engineering Aide</title>
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
            <AideCompliance />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

AideCompliancePage.getLayout = (page) => (
  <SidebarLayout userRole="aide">{page}</SidebarLayout>
);

export default AideCompliancePage;
