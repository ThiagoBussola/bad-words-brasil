# Bem vindo ao Bad Words Brasil

##


### Ao instalar o pacote você irá utilizar a função:
```js
preventableWord()
```

Essa função recebe por parâmetro uma _string_, pode ser uma única palavra ou uma frase completa.

Caso exista alguma palabra inapropriada em sua _string_ a função irá retornar **true**. Caso contrário sua frase não é inapropriada e não a nada a que devemos previnir, então a função irá retornar **false**.


### Exemplo de palavra inapropriada

```js
// retorna true pois otario é uma palavra inapropriada
preventableWord('otario')
```

### Exemplo de palavra apropriada

```js
// retorna false pois feliz é uma palavra inapropriada
preventableWord('feliz')
```


Caso precise criar uma palavra inapropriada própria, você deve adicionalá ao array do arquivo badWords.ts



Link do github: https://github.com/ThiagoBussola/bad-words-brasil


### Mais palavras inapropriadas e combinações com caracteres especiais serão adicionadas com o passar do tempo.

### Este é meu primeiro pacote NPM, fique a vontade para contribuir no projeto.