#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
آلة حاسبة بسيطة - Simple Calculator
"""

def add(x, y):
    """جمع - Addition"""
    return x + y

def subtract(x, y):
    """طرح - Subtraction"""
    return x - y

def multiply(x, y):
    """ضرب - Multiplication"""
    return x * y

def divide(x, y):
    """قسمة - Division"""
    if y == 0:
        return "خطأ: لا يمكن القسمة على صفر (Error: Cannot divide by zero)"
    return x / y

def power(x, y):
    """أس - Power"""
    return x ** y

def main():
    """البرنامج الرئيسي - Main Program"""
    print("=" * 50)
    print("مرحباً بك في آلة الحاسبة البسيطة")
    print("Welcome to Simple Calculator")
    print("=" * 50)
    
    while True:
        print("\nاختر العملية - Select an operation:")
        print("1. جمع (Add) +")
        print("2. طرح (Subtract) -")
        print("3. ضرب (Multiply) *")
        print("4. قسمة (Divide) /")
        print("5. أس (Power) **")
        print("6. خروج (Exit)")
        
        choice = input("\nأدخل اختيارك (Enter your choice) (1/2/3/4/5/6): ").strip()
        
        if choice == '6':
            print("\nشكراً لاستخدامك آلة الحاسبة - Thank you for using the calculator!")
            break
        
        if choice in ('1', '2', '3', '4', '5'):
            try:
                num1 = float(input("أدخل الرقم الأول (Enter first number): "))
                num2 = float(input("أدخل الرقم الثاني (Enter second number): "))
                
                if choice == '1':
                    print(f"\n{num1} + {num2} = {add(num1, num2)}")
                elif choice == '2':
                    print(f"\n{num1} - {num2} = {subtract(num1, num2)}")
                elif choice == '3':
                    print(f"\n{num1} * {num2} = {multiply(num1, num2)}")
                elif choice == '4':
                    result = divide(num1, num2)
                    print(f"\n{num1} / {num2} = {result}")
                elif choice == '5':
                    print(f"\n{num1} ** {num2} = {power(num1, num2)}")
                    
            except ValueError:
                print("خطأ: يرجى إدخال أرقام صحيحة - Error: Please enter valid numbers")
        else:
            print("خيار غير صحيح - Invalid choice. Please try again.")

if __name__ == "__main__":
    main()
