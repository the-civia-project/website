export type EmailProps = {
  emailId: string;
};

export type ConfirmSubscriptionProps = EmailProps & {
  validationCode: string;
};
