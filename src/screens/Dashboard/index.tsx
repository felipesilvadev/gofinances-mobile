import React, { useState, useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from 'styled-components';
import { HighlightCard } from '../../components/HighlightCard';
import { TransactionCard, TransactionCardProps } from '../../components/TransactionCard';

import { 
  Container,
  Header,
  UserWrapper,
  UserInfo,
  Photo,
  User,
  UserGreeting,
  UserName,
  LogoutButton,
  Icon,
  HighlightCards,
  Transactions,
  Title,
  TransactionList,
  LoadContainer,
} from './styles';
import { useCallback } from 'react';

export interface DataListProps extends TransactionCardProps {
  id: string;
}

type HighlightProps = {
  amount: string;
  lastTransaction: string;
};

interface HighlightData {
  income: HighlightProps;
  outcome: HighlightProps;
  total: HighlightProps;
}

const dataKey = '@gofinances:transactions';

export function Dashboard() {
  const theme = useTheme();

  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<DataListProps[]>([]);
  const [highlightData, setHighlightData] = useState<HighlightData>({} as HighlightData);

  function formatCurrency(value: string | number) {
    return Number(value)
      .toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });
  }

  function formatDate(date: string) {
    return Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    }).format(new Date(date));
  }

  function getLastTransactionDate(
    collection: DataListProps[],
    type: 'up' | 'down') 
  {
    const lastTransaction = new Date(
      Math.max.apply(Math,
        collection
          .filter(transaction => transaction.type === type)
          .map(transaction => new Date(transaction.date).getTime())
      )
    );

    return `${lastTransaction.getDate()} de ${lastTransaction.toLocaleString('pt-BR', { month: 'long' })}`;
  }

  async function loadTransactions() {
    const response = await AsyncStorage.getItem(dataKey);

    const transactions = response ? JSON.parse(response) : [];

    let incomeTotal = 0;
    let outcomeTotal = 0;

    const transactionsFormatted: DataListProps[] = transactions
      .map((transaction: DataListProps) => {
        transaction.type === 'up' ?
          incomeTotal += Number(transaction.amount) :
          outcomeTotal += Number(transaction.amount);

        const amount = formatCurrency(transaction.amount);

        const date = formatDate(transaction.date);

        return {
          id: transaction.id,
          name: transaction.name,
          amount,
          type: transaction.type,
          category: transaction.category,
          date,
        };
      }
    );

    setTransactions(transactionsFormatted);
    
    const total = incomeTotal - outcomeTotal;

    setHighlightData({
      income: {
        amount: formatCurrency(incomeTotal),
        lastTransaction: `Última entrada dia ${getLastTransactionDate(transactions, 'up')}`
      },
      outcome: {
        amount: formatCurrency(outcomeTotal),
        lastTransaction: `Última saída dia ${getLastTransactionDate(transactions, 'down')}`
      },
      total: {
        amount: formatCurrency(total),
        lastTransaction: `01 à ${getLastTransactionDate(transactions, 'down')}`
      }
    });

    setIsLoading(false);
  }

  useEffect(() => {
    loadTransactions();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [])
  );

  return (
    <Container>
      {
        isLoading ? (
          <LoadContainer>
            <ActivityIndicator 
              color={theme.colors.primary} 
              size="large"
            />
          </LoadContainer>
        ) : (
        <>
          <Header>
            <UserWrapper>
              <UserInfo>
                <Photo source={{ uri: 'https://avatars.githubusercontent.com/u/38724010?v=4' }} />

                <User>
                  <UserGreeting>Olá,</UserGreeting>
                  <UserName>Felipe</UserName>
                </User>
              </UserInfo>

              <LogoutButton onPress={() => {}}>
                <Icon name="power" />
              </LogoutButton>
            </UserWrapper>
          </Header>

          <HighlightCards>
            <HighlightCard 
              type="up"
              title="Entradas"
              amount={highlightData.income.amount}
              lastTransaction={highlightData.income.lastTransaction}
            />
            <HighlightCard
              type="down"
              title="Saídas"
              amount={highlightData.outcome.amount}
              lastTransaction={highlightData.outcome.lastTransaction}
            />
            <HighlightCard 
              type="total"
              title="Total"
              amount={highlightData.total.amount}
              lastTransaction={highlightData.total.lastTransaction}
            />
          </HighlightCards>
        
          <Transactions>
            <Title>Listagem</Title>

            <TransactionList
              data={transactions}
              keyExtractor={item => item.id}
              renderItem={({ item }) => <TransactionCard data={item} />}
            />
          </Transactions>
        </>
      )}
    </Container>
  );
}
