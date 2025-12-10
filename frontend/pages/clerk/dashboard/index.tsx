import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import PageHeader from '@/content/Management/Transactions/PageHeader';
import PageTitleWrapper from '@/components/PageTitleWrapper';
import { Grid, Container } from '@mui/material';
import Footer from '@/components/Footer';

import ClerkDashboard from '@/clerk';

function ApplicationsTransactions() {
  return (
    <>

      <Container maxWidth="lg">
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="stretch"
          spacing={3}
        >
          <Grid item xs={12}>
            <ClerkDashboard />
          </Grid>
        </Grid>
      </Container>
      <Footer />
    </>
  );
}

ApplicationsTransactions.getLayout = (page) => (
  <SidebarLayout userRole="engineer">{page}</SidebarLayout>
);

export default ApplicationsTransactions;