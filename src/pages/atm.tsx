import {
    DAILY_DEBIT_AMOUNT_LIMIT,
    useCustomerData,
} from '@/components/CustomerProvider';
import {
    Box,
    Button,
    FilledInput,
    Grid,
    InputAdornment,
    InputLabel,
    Paper,
    Typography,
} from '@mui/material';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

interface DepositFormInput {
    depositAmount: number;
}

interface DebitFormInput {
    debitAmount: number;
}

const Atm = () => {
    const {
        firstName,
        lastName,
        getBalance,
        addDeposit,
        addDebit,
        isUnderWithdrawalAmountLimit,
    } = useCustomerData();

    const { handleSubmit: handleDepositSubmit, control: depositControl } =
        useForm<DepositFormInput>({ mode: 'all' });
    const {
        handleSubmit: handleDebitSubmit,
        control: debitControl,
        setError: setDebitError,
    } = useForm<DebitFormInput>({ mode: 'all' });

    const onDepositSubmit: SubmitHandler<DepositFormInput> = (data) => {
        addDeposit(data.depositAmount);
    };

    const onDebitSubmit: SubmitHandler<DebitFormInput> = (data) => {
        try {
            addDebit(data.debitAmount);
        } catch (err: any) {
            setDebitError('debitAmount', err);
        }
    };

    return (
        <Box maxWidth="md" sx={{ margin: 'auto' }}>
            <Paper sx={{ padding: '2em' }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sx={{ textAlign: 'center' }}>
                        <Typography variant="h2">ATM</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Grid container sx={{ textAlign: 'center' }}>
                            <Grid item xs={12}>
                                <Typography variant="h3" component="div">
                                    Hello, {firstName} {lastName}!
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="h4" component="div">
                                    Your Balance: ${getBalance()}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={6}>
                        <Grid container sx={{ textAlign: 'center' }}>
                            <Grid item xs={12}>
                                <form
                                    onSubmit={handleDepositSubmit(
                                        onDepositSubmit
                                    )}
                                >
                                    <Controller
                                        name={'depositAmount'}
                                        control={depositControl}
                                        render={({
                                            field,
                                            fieldState: { error },
                                        }) => (
                                            <>
                                                <InputLabel htmlFor="filled-adornment-depositamount">
                                                    Amount to Deposit
                                                </InputLabel>
                                                <FilledInput
                                                    {...field}
                                                    id="filled-adornment-depositamount"
                                                    error={!!error?.message}
                                                    size="small"
                                                    startAdornment={
                                                        <InputAdornment position="start">
                                                            $
                                                        </InputAdornment>
                                                    }
                                                />
                                            </>
                                        )}
                                        rules={{
                                            required:
                                                'This is a required field',
                                        }}
                                    />

                                    <Button type="submit" variant="contained">
                                        Deposit
                                    </Button>
                                </form>
                            </Grid>
                            <Grid item xs={12}>
                                <form
                                    onSubmit={handleDebitSubmit(onDebitSubmit)}
                                >
                                    <Controller
                                        name={'debitAmount'}
                                        control={debitControl}
                                        render={({
                                            field,
                                            fieldState: { error },
                                        }) => (
                                            <>
                                                <InputLabel htmlFor="filled-adornment-debitamount">
                                                    Amount to Withdraw
                                                </InputLabel>
                                                <FilledInput
                                                    {...field}
                                                    id="filled-adornment-debitamount"
                                                    error={!!error?.message}
                                                    startAdornment={
                                                        <InputAdornment position="start">
                                                            $
                                                        </InputAdornment>
                                                    }
                                                />
                                            </>
                                        )}
                                        rules={{
                                            required:
                                                'This is a required field',
                                            validate: {
                                                withdrawalLimit: (value) => {
                                                    const isError =
                                                        isUnderWithdrawalAmountLimit(
                                                            Number(value)
                                                        );
                                                    return isError;
                                                },
                                            },
                                        }}
                                    />
                                    <Button type="submit" variant="contained">
                                        Withdraw
                                    </Button>
                                </form>
                                <Typography>
                                    There is a daily withdrawl limit of $
                                    {DAILY_DEBIT_AMOUNT_LIMIT}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
};

export default Atm;
