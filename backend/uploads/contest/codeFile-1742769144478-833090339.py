def sum_of_digits(n):
    return sum(int(digit) for digit in str(n))

if __name__ == "__main__":
    num = int(input("Enter a number: "))
    print(sum_of_digits(num))
