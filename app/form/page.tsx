import FormClient from './FormClient';

type PageProps = {
  searchParams: {
    friendId?: string;
  };
};

export default function Page({ searchParams }: PageProps) {
  return <FormClient friendId={searchParams.friendId ?? ''} />;
}
