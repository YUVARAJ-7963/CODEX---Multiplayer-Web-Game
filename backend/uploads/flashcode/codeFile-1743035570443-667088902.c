#include <stdio.h>

int main() {
    int arr1[] = {1, 2, 3};
    int arr2[] = {4, 5, 6};
    int size = sizeof(arr1) / sizeof(arr1[0]);
    int result[size];

    for (int i = 0; i < size; i++) {
        result[i] = arr1[i] + arr2[i];
    }

    printf("Result: ");
    for (int i = 0; i < size; i++) {
        printf("%d ", result[i]);
    }

    return 0;
}
